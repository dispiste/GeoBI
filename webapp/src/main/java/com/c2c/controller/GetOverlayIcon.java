package com.c2c.controller;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtilities;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.block.BlockBorder;
import org.jfree.chart.block.RectangleConstraint;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.chart.renderer.category.StandardBarPainter;
import org.jfree.chart.title.LegendTitle;
import org.jfree.data.Range;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.jfree.ui.Size2D;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


/**
 * @author pmauduit, stolen from tbonfort's code from cdc_geodecisionnel project
 */

@Controller
@RequestMapping("/getoverlayicon")
public class GetOverlayIcon extends AbstractQueryingController {
    public static final Color TRANSPARENT = new Color(0, 0, 0, 0);

    public enum ChartType {
        PIE, BAR;
    }
    
    @RequestMapping(method = RequestMethod.GET)
    public void getchart(HttpServletRequest request,
                         HttpServletResponse response,
                         @RequestParam("DATA") String data,
                         @RequestParam("TYPE") String type,
                         @RequestParam("WIDTH") int width,
                         @RequestParam("HEIGHT") int height,
                         @RequestParam(value = "LABELS", required = false) String labels,
                         @RequestParam(value = "FORMAT", required = false) String format,
                         @RequestParam(value = "LEGEND", required = false) Boolean onlyLegend
                         )
            throws Exception {
        final OutputStream outputStream = response.getOutputStream();

        if (format == null) {
            response.setContentType("image/png");
        } else {
            response.setContentType(format);
        }
        boolean legend;
        if (onlyLegend == null)
        {
        	legend = false;
        }
        else
        {
        	legend = onlyLegend;

            response.setContentType(format);
            response.addHeader("Cache-Control", "no-cache");
            response.addHeader("Expires", "-1");

        }
        if (labels == null)
        	labels = "";
        
        
        try {
        	renderChart(parseData(data), parseLabels(labels), width, height, type, legend, outputStream);
        } catch (Exception e)
        {
        	e.printStackTrace();
        } finally {
            outputStream.close();
        }

    }

    private static JFreeChart getBarChart(double[] data, String[] labels, boolean legend) throws IOException {
        DefaultCategoryDataset catDataset = new DefaultCategoryDataset();

        for (int i = 0; i < data.length; i++) {
            //catDataset.setValue(data[i], Integer.valueOf(i), "");
        	if ((labels.length > i) && (! labels[i].equals("")))
        		catDataset.setValue(data[i],labels[i], "");        		
        	else /* no label */
        		catDataset.setValue(data[i], Integer.valueOf(i), "");
        }
        JFreeChart  chart ;
        if (legend == false)
        	chart = ChartFactory.createBarChart(null, null, null, catDataset, PlotOrientation.VERTICAL,
                false, false, false);
        else
        	chart = ChartFactory.createBarChart(null, null, null, catDataset, PlotOrientation.VERTICAL,
                    true, false, false);
        chart.setBackgroundPaint(TRANSPARENT);
        chart.setBorderVisible(false);

        CategoryPlot plot = (CategoryPlot) chart.getPlot();

        plot.setBackgroundPaint(TRANSPARENT);

        plot.setRangeGridlinesVisible(false);
        plot.setOutlineVisible(false);
        plot.getRangeAxis().setAxisLineVisible(false);
        plot.getRangeAxis().setTickLabelsVisible(false);
        plot.getRangeAxis().setTickMarksVisible(false);
        plot.getDomainAxis().setAxisLineVisible(false);
        plot.getDomainAxis().setTickLabelsVisible(false);
        plot.getDomainAxis().setTickMarksVisible(false);

		BarRenderer r = (BarRenderer) plot.getRenderer();
		
		
		// using predefined colors
        for (int i = 0; i < Math.min(catDataset.getColumnCount(), 8); i++) {
        	r.setSeriesPaint(i, GetChart.DEFAULT_COLORS[i]);
        }
        r.setBarPainter(new StandardBarPainter());
        r.setDefaultShadowsVisible(false);
        r.setDrawBarOutline(false);
        r.setShadowVisible(false);
        return chart;
    }
    
    private static JFreeChart getPieChart(double[] data, String[] labels, boolean legend) throws IOException {
        DefaultPieDataset pieDataset = new DefaultPieDataset();

        for (int i = 0; i < data.length; i++) {
        	if ((labels.length > i) && (! labels[i].equals("")))
        		pieDataset.setValue(labels[i], data[i]);        		
        	else /* no label */
        		pieDataset.setValue(Integer.valueOf(i), data[i]);
        }
        JFreeChart chart ;
        if (legend == false)
        	chart = ChartFactory.createPieChart(null, pieDataset, false, false, false);
        else
        	chart = ChartFactory.createPieChart(null, pieDataset, true, true, false);
        	
        chart.setBackgroundPaint(TRANSPARENT);
        chart.setBorderVisible(false);

        PiePlot plot = (PiePlot) chart.getPlot();
        java.util.List l = pieDataset.getKeys();

        for (int i = 0; i < Math.min(pieDataset.getItemCount(), 8); i++) {
            plot.setSectionPaint((Comparable) l.get(i), GetChart.DEFAULT_COLORS[i]);
        }

        plot.setBackgroundPaint(TRANSPARENT);

        plot.setLabelGenerator(null);
        plot.setInteriorGap(0);
        plot.setShadowXOffset(0);
        plot.setShadowYOffset(0);
        plot.setOutlineVisible(false);
        return chart;
    }
    
    private static BufferedImage chartLegendToBuffImage(JFreeChart chart, int width, int height) {
    	LegendTitle lgd = chart.getLegend();
    	lgd.setMargin(0,0,1,1);
    	lgd.setBackgroundPaint(TRANSPARENT);
    	lgd.setBorder(BlockBorder.NONE);
    	
    	BufferedImage img = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = img.createGraphics();
        // TODO : should be ok for the main requests, but could overlap in some cases
        Size2D size = lgd.arrange(g2, new RectangleConstraint(new Range(0.0, width * 1.5),new Range(0.0, height)));
        g2.dispose();
        int w = (int) Math.rint(size.width);
        int h = (int) Math.rint(size.height);
        BufferedImage img2 = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g22 = img2.createGraphics();
        lgd.draw(g22, new Rectangle2D.Double(0, 0, w, h));
        g22.dispose();
        return img2;
    }
    
    private static void renderChart(double[] data, String[] labels, int width, int height, String type, boolean legend, OutputStream outputStream) throws IOException {
    	JFreeChart chart = null;
        switch (ChartType.valueOf(type.toUpperCase())) {
                case PIE:
                    chart = getPieChart(data, labels, legend);
                    break;
                case BAR:
                	chart = getBarChart(data, labels, legend);
                    break;
                default:
                    throw new IllegalArgumentException(type + " not supported overlay type");
        }
        if (legend == false)
        {
        	ChartUtilities.writeChartAsPNG(outputStream, chart, width, height);
        }
        else
        {
        	ChartUtilities.writeBufferedImageAsPNG(outputStream, chartLegendToBuffImage(chart, width, height));
        }
    }
    
    public static BufferedImage renderChart(double[] data, String[] labels, int width, int height, String type, boolean legend) throws IOException {
    	JFreeChart chart = null;
        switch (ChartType.valueOf(type.toUpperCase())) {
                case PIE:
                    chart = getPieChart(data, labels, legend);
                    break;
                case BAR:
                	chart = getBarChart(data, labels, legend);
                    break;
                default:
                    throw new IllegalArgumentException(type + " not supported overlay type");
        }
        if (legend == false)
        {
        	return chart.createBufferedImage(width, height);
        }
        else
        {
        	return chartLegendToBuffImage(chart, width, height);
        }
    }

    private static double[] parseData(String data) {
        String[] parts = data.split(",");
        double[] values = new double[parts.length];

        for (int i = 0; i < parts.length; i++) {
        	if (! parts[i].equals("null"))
        		values[i] = Double.parseDouble(parts[i]);
        	else // no data available. TODO : is it the awaited behaviour ?
        		values[i] = Double.parseDouble("0.0");
        }

        return values;
    }
    private static String[] parseLabels(String data) {
		String[] parts = data.split(",");
        String[] values = new String[parts.length];
        for (int i = 0; i < parts.length; i++) {
        		values[i] = parts[i];
        }
        return values;
    }

    /*
    private static String[] parseLabels(String data) {
    	ArrayList parts;
		try {
			parts=(JSONArray)jsonParser.parse("["+data+"]");
		} catch (ParseException e) {
			parts = new ArrayList(); 
			Collections.addAll(parts, data.split(","));
		}
        String[] values = new String[parts.size()];
        for (int i = 0; i < parts.size(); i++) {
        		values[i] = (String)parts.get(i);
        }

        return values;
    }*/
}