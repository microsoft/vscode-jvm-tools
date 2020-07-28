package com.microsoft.jvmms.test;

import static io.restassured.RestAssured.given;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
public class JVMListTest {

    @Test
    public void testHelloEndpoint() {
        var body = given().when().get("/jvm/list").then().statusCode(200).extract().body().asString();
        System.out.println(body);
    }

}
