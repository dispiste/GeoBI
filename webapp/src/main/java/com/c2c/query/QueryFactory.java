package com.c2c.query;

import com.c2c.cube.CubeFactory;
import com.c2c.cube.CubeInfo;

/**
 * Factory for creating queries.  It is configured with the
 * default parameters which act as a base for creating specific queries
 * <p/>
 * User: jeichar
 * Date: Jul 2, 2010
 * Time: 12:11:56 PM
 */
public class QueryFactory {
    private final CubeFactory cubeFactory;

    public QueryFactory(CubeFactory cubeFactory) {
        this.cubeFactory = cubeFactory;
    }

    public DataQuery createDataQuery(String mdx) {
        CubeInfo info = cubeFactory.getFromMDX(mdx);
        return new DataQuery(info.getJdbcConnection(), info.getDefFile(), mdx);
    }

    public DimensionsQuery createDimensionsQuery(String cube) {
        CubeInfo info = cubeFactory.getCubeDef(cube);
        return new DimensionsQuery(info.getJdbcConnection(),
                info.getSimpleDefFile(), cube);
    }

    public LevelsQuery createLevelsQuery(String cube) {
        CubeInfo info = cubeFactory.getCubeDef(cube);
        return new LevelsQuery(info.getJdbcConnection(),
                info.getSimpleDefFile(), cube);
    }

    public MeasuresQuery createMeasuresQuery(String cube) {
        CubeInfo info = cubeFactory.getCubeDef(cube);
        return new MeasuresQuery(info.getJdbcConnection(),
                info.getSimpleDefFile(), cube);
    }

    public MembersQuery createMembersQuery(String cube, String dim) {
        CubeInfo info = cubeFactory.getCubeDef(cube);
        return new MembersQuery(info.getJdbcConnection(),
                info.getSimpleDefFile(), cube, dim);
    }

    public CubeFactory getCubeFactory() {
        return this.cubeFactory;
    }
}
