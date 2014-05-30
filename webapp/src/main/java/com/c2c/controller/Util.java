package com.c2c.controller;

import java.awt.Color;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.geotools.styling.Stroke;
import org.geotools.styling.Style;
import org.geotools.styling.StyleBuilder;
import org.geotools.styling.Symbolizer;

import com.c2c.data.DataQueryDimension;
import com.c2c.data.DataQueryFeatureSource;
import com.c2c.data.DataQueryLevel;
import com.c2c.data.DataQueryMember;
import com.c2c.query.DataQuery;

/**
 * More or less random shared utilities
 * User: jeichar
 * Date: Jul 5, 2010
 * Time: 11:06:20 AM
 */
public final class Util {

    private Util() {
    }

    public static enum SYMBOL_TYPE { NONE, PROPORTIONAL_SYMBOLS, BARS, PIES }
    private static String MEMBER_SEPARATOR=", ";
    

    public static Style createDefaultStyle() {

        StyleBuilder styleBuilder = new StyleBuilder();
        Symbolizer symb = styleBuilder.createLineSymbolizer(Color.BLACK, 1);

        return styleBuilder.createStyle(symb);
    }

    public static Stroke defaultStroke() {
        return new StyleBuilder().createStroke(Color.BLACK, 1.0);
    }
    
    public static int getDpiFromFormat(String formatOptions) {
    	
    	String[] options = formatOptions.split(";");
    	for (String option : options) {
    		String[] keyvalue = option.split(":");
    		if (keyvalue[0].equalsIgnoreCase("dpi")) {
    			int dpi = Integer.parseInt(keyvalue[1]);
    			return dpi;
    		}
    	}
    	return 90;  // Standard screen dpi
    }
    
    public static String normalizeName(String str) {
    	String ret = new String(str);

    	ret = ret.trim();
    	ret = ret.replace("}].[{", "__");
    	ret = ret.replace("].[", "_");
    	ret = ret.replace("{[", "");
    	ret = ret.replace("]}", "");
    	ret = ret.replace(".", "_");

    	return ret;
    }
    
    private static List<IndicatorMetadata> getIndicators(List<DataQueryDimension> columns) {
    	
    	List<IndicatorMetadata> indicators = new ArrayList<IndicatorMetadata>();
    	for (DataQueryDimension c : columns) {
    		List<IndicatorMetadata> newIndicators = new ArrayList<IndicatorMetadata>();
    		
    		if (indicators.isEmpty()) {
    			for (DataQueryLevel l : c.getLevels()) {
	    			for (DataQueryMember m : l.getMembers()) {
	    				newIndicators.add(new IndicatorMetadata(m.getName(),
	    						DataQuery.getUniqueId(m.getUniqueName())));
	    			}
    			}
    		} else {
    			for (IndicatorMetadata i : indicators) {
    				for (DataQueryLevel l : c.getLevels()) {
    					for (DataQueryMember m : l.getMembers()) {
    						newIndicators.add(new IndicatorMetadata(i.getName() + ", " + m.getName(),
    								i.getDataIndex() + "_" + DataQuery.getUniqueId(m.getUniqueName())));
    					}
    				}
    			}    			
    		}
    		indicators = newIndicators;
    	}
    	return indicators;
    }
    
    public static HashMap<String, String> lookupIndicators(DataQueryFeatureSource results) {
    	
    	HashMap<String, String> ret = new HashMap<String, String>(); 
    	for (IndicatorMetadata i : getIndicators(results.getColumns())) {
    			ret.put(i.getDataIndex(), i.getName());
        	}
    	return ret;
    }
    
    public static String[] getHumanReadableIndicators(DataQueryFeatureSource results, String[] indicList) {
    	
    	ArrayList<String> ret = new ArrayList<String>();
    	
    	HashMap<String, String> indic = lookupIndicators(results);
    	for (int i = 0 ; i < indicList.length ; i++)
    	{
    		ret.add(indic.get(indicList[i]));
    	}
    	return ret.toArray(new String[ret.size()]);
    }
    
    public static String getConcatenatedIndicators(DataQueryFeatureSource results, String[] indicList) {
    	
    	StringBuffer buf = new StringBuffer();
    	
    	HashMap<String, String> indic = lookupIndicators(results);
    	int last = indicList.length - 1;
    	for (int i = 0 ; i < last ; i++)
    	{
    		buf.append(indic.get(indicList[i]));
    		buf.append(MEMBER_SEPARATOR);
    	}
    	buf.append(indic.get(indicList[last]));
    	
    	return buf.toString();
    }
    
    public static String getSymbolsDimensions(DataQueryFeatureSource results) {
    	
    	String dims = "";
    	for (DataQueryDimension c : results.getColumns()) {
    		if (!dims.equals("")) {
    			dims += MEMBER_SEPARATOR;
    		}
    		dims += c.getUniqueName().replace("[", "").replace("]", "");
    	}
    	return dims;
    }
    
    /**
     * Calculates the scale denominator from a world distance, a map distance in pixels and
     * the DPIs of the map.
     * @param worldDistance World distance in meters
     * @param mapPixels
     * @param mapDPI
     * @return
     */
    public static int getScale(double worldDistance, double mapPixels, double mapDPI) {
        // 1 inch = 0.0254 metres
        return (int) (worldDistance / ((0.0254*mapPixels)/mapDPI));
    }
}
