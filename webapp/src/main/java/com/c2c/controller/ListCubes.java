package com.c2c.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.c2c.cube.CubeFactory;
import com.c2c.cube.CubeInfo;

@Controller
public class ListCubes extends AbstractQueryingController {

    @RequestMapping("/getcubes")
    public void listcubes(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter writer = response.getWriter();
        try {

            JSONArray jsonArray = new JSONArray();
            CubeFactory cubes = this.getQueryFactory().getCubeFactory();
            Iterator<CubeInfo> it = cubes.getCubes().iterator();
            while (it.hasNext()) {
                CubeInfo info = it.next();
                HashMap<String, String> membersMap = new HashMap<String, String>();
                membersMap.put("CUBE_NAME", info.getName());
                membersMap.put("CUBE_TITLE", info.getTitle());
                membersMap.put("CUBE_DESC", info.getDescription());
                jsonArray.add(membersMap);
            }
            JSONObject jsonObj = new JSONObject();
            jsonObj.put("cubes", jsonArray);
            writer.write(jsonObj.toString());
        } finally {
            writer.close();
        }
    }

}
