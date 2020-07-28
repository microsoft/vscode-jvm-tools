package com.microsoft.jvmms.services;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.microsoft.jvmms.core.JVM;
import com.microsoft.jvmms.core.JVMControlCenter;

@Path("/jvm/list")
public class JVMList {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<JVM> hello() {
        return new JVMControlCenter().list();
    }
}
