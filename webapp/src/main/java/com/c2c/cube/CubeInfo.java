package com.c2c.cube;

public class CubeInfo {
    
    private String defFile;
    private String simpleDefFile;
    private String title;
    private String jdbcConnection;
    private String name;
    private String description;
    
    public CubeInfo() {
    }

    public String getSimpleDefFile() {
        return simpleDefFile;
    }

    public String getDefFile() {
        return defFile;
    }

    /**
     * Title: human readable cube name
     * 
     * @return
     */
    public String getTitle() {
        return title;
    }

    public String getJdbcConnection() {
        return jdbcConnection;
    }

    public void setJdbcConnection(String dbName) {
        this.jdbcConnection = dbName;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setSimpleDefFile(String simpleDefFile) {
        this.simpleDefFile = simpleDefFile;
    }

    public void setDefFile(String defFile) {
        this.defFile = defFile;
    }

    /**
     * Name: machine readable cube name
     * 
     * @return
     */
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
