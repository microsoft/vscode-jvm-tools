package com.microsoft.jvmms;

import com.sun.tools.attach.VirtualMachine;

public class Start {

    public static void main(String[] args) {
        VirtualMachine.list().forEach(jvm -> {
            System.out.println("JVM: " + jvm.id() + " " + jvm.displayName());
        });

    }
}
