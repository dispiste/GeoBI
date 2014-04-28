package com.c2c.cube;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CubeFactory {
    private final HashMap<String, CubeInfo> cubes = new HashMap<String, CubeInfo>();
    private final Pattern pattern = Pattern.compile("FROM\\s*(\\S*)\\s*\\z");

    public CubeFactory(Map<String, CubeInfo> cubes) {
        setCubes(cubes);
    }

    public CubeInfo getCubeDef(String cubeName) {
        return cubes.get(cubeName);
    }

    public String getNameFromMDX(String mdx) {
        Matcher matcher = pattern.matcher(mdx);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public CubeInfo getFromMDX(String mdx) {
        String name = getNameFromMDX(mdx);
        return getCubeDef(name);
    }

    public Collection<CubeInfo> getCubes() {
        return cubes.values();
    }

    private void setCubes(Map<String, CubeInfo> cubes) {
        Iterator<String> it = cubes.keySet().iterator();
        while (it.hasNext()) {
            String name = it.next();
            CubeInfo info = cubes.get(name);
            info.setName(name);
            info.setDefFile(CubeFactory.class.getClassLoader()
                    .getResource(info.getDefFile()).getFile());
            info.setSimpleDefFile(CubeFactory.class.getClassLoader()
                    .getResource(info.getSimpleDefFile()).getFile());
            this.cubes.put(name, info);
        }
    }
}
