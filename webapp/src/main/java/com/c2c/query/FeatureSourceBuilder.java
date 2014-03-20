package com.c2c.query;

import java.io.IOException;
import java.util.ArrayList;

import org.geotools.data.DataUtilities;
import org.geotools.data.collection.ListFeatureCollection;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;

/**
 * Takes the simplified {@link DataAttribute} and {@link DataAttributeDef} data
 * contained in a {@link DataQueryResults} object and converts them into a
 * FeatureSource which is used to render the features and perform the other
 * actions required by the controllers
 *
 * @author jeichar
 */
public class FeatureSourceBuilder {

    /**
     * Entry point method. Takes the simplified {@link DataAttribute} and
     * {@link DataAttributeDef} data contained in a {@link DataQueryResults} object and
     * converts them into a FeatureSource which is used to render the features
     * and perform the other actions required by the controllers
     */
    public SimpleFeatureSource createFeatureStore(
            final DataQueryResults parser) throws IOException {
      
        SimpleFeatureType type = createFeatureType(parser.getFeatureTypeSpec(), parser.defaultGeom());
        ArrayList<SimpleFeature> list = new ArrayList<SimpleFeature>();
        int i = 1;
        for (Iterable<DataAttribute> spec : parser) {
            list.add( toFeature(i, type, spec) );
            i++;
        }
        SimpleFeatureCollection collection = new ListFeatureCollection(type,list);
        return DataUtilities.source( collection );
    }

    private SimpleFeature toFeature(int i, SimpleFeatureType simpleFeatureType,
                                    Iterable<DataAttribute> spec) {
        SimpleFeatureBuilder builder = new SimpleFeatureBuilder(
                simpleFeatureType);
        for (DataAttribute e : spec) {
            builder.set(e.name(), e.value());
        }
        return builder.buildFeature("result-" + i);
    }
    
    private SimpleFeatureType createFeatureType(Iterable<DataAttributeDef> featureTypeSpec, String defaultGeom) throws IOException {
        SimpleFeatureTypeBuilder ftBuilder = new SimpleFeatureTypeBuilder();
        String ftName = "results";
        ftBuilder.setName(ftName);
        for (DataAttributeDef entry : featureTypeSpec) {
            ftBuilder.add(entry.name(), entry.value());
        }

        ftBuilder.setDefaultGeometry(defaultGeom);
        return ftBuilder.buildFeatureType();
    }

}
    