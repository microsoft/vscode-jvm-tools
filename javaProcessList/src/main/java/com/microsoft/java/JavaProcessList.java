package com.microsoft.java;

import com.sun.tools.attach.VirtualMachine;

public class JavaProcessList {

    public static void main(String[] args) {
        VirtualMachine.list()
                .forEach(jvm -> {
                    System.out.println("JVM: " + jvm.id() + " " + jvm.displayName());
                });

    }
}