package com.microsoft.jvmms.core;

import java.util.List;
import java.util.stream.Collectors;

import com.sun.tools.attach.VirtualMachine;

public class JVMControlCenter {

    public List<JVM> list() {
        return VirtualMachine.list().stream().map(jvm -> new JVM(Integer.parseInt(jvm.id()), jvm.displayName()))
                .collect(Collectors.toList());
    }

}
