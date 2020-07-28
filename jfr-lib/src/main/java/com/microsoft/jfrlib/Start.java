package com.microsoft.jfrlib;

import com.newrelic.jfr.daemon.JFRJMXRecorder;
import com.sun.tools.attach.VirtualMachine;
import jdk.jfr.consumer.RecordedEvent;
import jdk.jfr.consumer.RecordingFile;

import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

public class Start {

    public static void main(String[] args) {
        VirtualMachine.list()
                .forEach(jvm -> {
                    if (jvm.displayName().contains("quarkus")) {
                        try {
                            Duration duration = Duration.ofSeconds(60);
                            LocalDateTime endTime = LocalDateTime.now().plus(duration);

                            JFRJMXRecorder jfr = JfrController.startRecording(jvm, duration);

                            jfr.startRecording();

                            Path file = jfr.recordToFile();

                            while (LocalDateTime.now().isBefore(endTime)) {
                                Thread.sleep(10000);
                                List<RecordedEvent> events = RecordingFile.readAllEvents(file);

                                System.out.println("Recording contains: " + events.size() + " events");
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
    }
}
