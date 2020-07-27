package com.microsoft.jfrlib;

import com.newrelic.jfr.daemon.JFRJMXRecorder;
import com.sun.tools.attach.AttachNotSupportedException;
import com.sun.tools.attach.VirtualMachine;
import com.sun.tools.attach.VirtualMachineDescriptor;

import javax.management.MBeanServerConnection;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

public class JfrController {

    private static final String CONNECTOR_ADDRESS_PROPERTY = "com.sun.management.jmxremote.localConnectorAddress";
    private static final String JAVA_HOME_PROPERTY = "java.home";

    private static final List<String> MANAGEMENT_AGENT_LOCATIONS = List.of(
            File.separator + "jre" + File.separator + "lib" + File.separator + "management-agent.jar",
            File.separator + "lib" + File.separator + "management-agent.jar"
    );

    private static String getAgentJar(VirtualMachine vm) throws IOException {
        String javaHome = getJavaHomeForProcess(vm);

        Optional<String> agentPath = MANAGEMENT_AGENT_LOCATIONS
                .stream()
                .map(path -> new File(javaHome + path))
                .filter(File::exists)
                .map(File::getAbsolutePath)
                .findFirst();

        return agentPath.orElse(null);

    }

    private static void installManagementAgent(VirtualMachine vm) throws UnableToInstallManagementAgentException {
        try {
            String urlPath = getJmxConnectorAddress(vm);
            if (urlPath == null) {
                String agentJar = getAgentJar(vm);
                if (agentJar == null) {
                    vm.startLocalManagementAgent();
                    return;
                }
                vm.loadAgent(agentJar);
            }
        } catch (Exception e) {
            throw new UnableToInstallManagementAgentException(e);
        }
    }

    private static String getJavaHomeForProcess(VirtualMachine vm) throws IOException {
        return vm.getSystemProperties().getProperty(JAVA_HOME_PROPERTY);
    }

    private static String getJmxConnectorAddress(VirtualMachine vm) throws IOException {
        return (String) vm.getAgentProperties().get(CONNECTOR_ADDRESS_PROPERTY);
    }


    public static JFRJMXRecorder startRecording(VirtualMachineDescriptor jvm, Duration recordingDuration) throws UnableToStartRecordingException {

        VirtualMachine vm = null;
        try {
            vm = VirtualMachine.attach(jvm);

            installManagementAgent(vm);

            JMXServiceURL url = new JMXServiceURL(getJmxConnectorAddress(vm));
            JMXConnector connector = JMXConnectorFactory.newJMXConnector(url, new HashMap<>());
            connector.connect();
            MBeanServerConnection connection = connector.getMBeanServerConnection();

            return new JFRJMXRecorder(connection, recordingDuration, false);
        } catch (IOException | UnableToInstallManagementAgentException | AttachNotSupportedException e) {
            throw new UnableToStartRecordingException(e);
        } finally {
            if (vm != null) {
                try {
                    vm.detach();
                } catch (IOException e) {
                    throw new UnableToStartRecordingException(e);
                }
            }
        }
    }


    static class UnableToInstallManagementAgentException extends Exception {
        public UnableToInstallManagementAgentException(Exception e) {
            super(e);
        }

    }

    static class UnableToStartRecordingException extends Exception {
        public UnableToStartRecordingException(Exception e) {
            super(e);
        }
    }
}
