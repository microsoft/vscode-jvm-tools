package com.microsoft.jvmms.core;

public class JVM {

    private int pid;
    private String name;

    public JVM(int pid, String name) {
        this.pid = pid;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public int getPid() {
        return pid;
    }

}
