package com.c2c.style;


import static org.geotools.filter.capability.FunctionNameImpl.parameter;

import java.io.IOException;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;

import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.visitor.CalcResult;
import org.geotools.feature.visitor.UniqueVisitor;
import org.geotools.filter.capability.FunctionNameImpl;
import org.geotools.filter.function.ClassificationFunction;
import org.geotools.filter.function.ExplicitClassifier;
import org.geotools.filter.function.RangedClassifier;
import org.geotools.util.NullProgressListener;
import org.opengis.filter.capability.FunctionName;


/**
 * Cloned Geotools class to fix the case in which double values have to be classified
 * instead of String values. TODO: Submit this correction to GeoTools in case they find it interesting
 *
 * @author Cory Horner
 * @author Cesar Martinez
 *
 * @source $URL: http://svn.osgeo.org/geotools/branches/2.7.x/modules/library/main/src/main/java/org/geotools/filter/function/UniqueIntervalFunction.java $
 */
public class UniqueIntervalFunction extends ClassificationFunction {

    public static FunctionName NAME = new FunctionNameImpl("UniqueInterval",
            RangedClassifier.class,
            parameter("value", Double.class),
            parameter("classes", Integer.class));
    
    public UniqueIntervalFunction() {
        super(NAME);
    }

	private Object calculate(SimpleFeatureCollection featureCollection) {
        try {
            int classNum = getClasses();
        	//use a visitor to grab the unique values
            UniqueVisitor uniqueVisit = new UniqueVisitor(getExpression());
        	if (getProgressListener() == null) 
        		setProgressListener(new NullProgressListener());
        	featureCollection.accepts(uniqueVisit, getProgressListener());
        	if (getProgressListener().isCanceled()) return null;
        
            CalcResult calcResult = uniqueVisit.getResult();
            if (calcResult == null) return null;
            List result = calcResult.toList();
            //sort the results and put them in an array
            Collections.sort(result, new Comparator() {
        
                public int compare(Object o1, Object o2) {
                    if (o1 == null) {
                        if (o2 == null) {
                            return 0; //equal
                        }
                        return -1; //less than
                    } else if (o2 == null) {
                        return 1;
                    }
                    if (o1 instanceof String && o2 instanceof String) {
                        return ((String) o1).compareTo((String) o2);
                    }
                    if (o1 instanceof Double && o2 instanceof Double) {
                    	return Double.compare((Double)o1, (Double) o2);
                    }
                    return 0;
                }
                
            });
            Object[] results = result.toArray();
            //put the results into their respective slots/bins/buckets
            Set[] values;
            if (classNum < results.length) { //put more than one item in each class 
            	//resize values array
            	values = new Set[classNum];
            	//calculate number of items to put in each of the larger bins
            	int binPop = new Double(Math.ceil((double) results.length / classNum)).intValue();
            	//determine index of bin where the next bin has one less item
        		int lastBigBin = results.length % classNum;
        		if (lastBigBin == 0) lastBigBin = classNum;
        		else lastBigBin--;
            	
            	int itemIndex = 0;
            	//for each bin
            	for (int binIndex = 0; binIndex < classNum; binIndex++) {
            		HashSet val = new HashSet();
            		//add the items
            		for (int binItem = 0; binItem < binPop; binItem++) 
            			val.add(results[itemIndex++]);
            		if (lastBigBin == binIndex)
        				binPop--; // decrease the number of items in a bin for the
        							// next iteration
            		//store the bin
            		values[binIndex] = val;
            	}
            } else {
            	if (classNum > results.length) {
            		classNum = results.length; //chop off a few classes
            	}
            	//resize values array
            	values = new Set[classNum];
            	//assign straight-across (1 item per class)
            	for (int i = 0; i < classNum; i++) {
            		HashSet val = new HashSet();
            		val.add(results[i]);
            		values[i] = val;
            	}
            }
            //save the result (list), finally
            return new ExplicitClassifier(values);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "UniqueIntervalFunction calculate failed", e);
            return null;
        }
    }

    public Object evaluate(Object feature) {
		if (!(feature instanceof FeatureCollection)) {
			return null;
		}
        return calculate((SimpleFeatureCollection) feature);
    }

    public int getArgCount() {
        return 2;
    }
}
