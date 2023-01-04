<%@page contentType=" text/html " %>
<%@page pageEncoding="UTF-8" %>
<%@page import=" com.crystaldecisions.report.web.viewer.CrPrintMode " %>  <%--  webreporting.jar --%>
<%@page import=" com.crystaldecisions.report.web.viewer.CrystalReportViewer " %>

<%  	
      
   try {
        // 建立一个viewer对象实例,并设置
        CrystalReportViewer viewer = new CrystalReportViewer();
        viewer.setEnableParameterPrompt(true);
        viewer.setOwnPage(true);
        viewer.setOwnForm(true);
        viewer.setPrintMode(CrPrintMode.ACTIVEX);

        // 从session中取报表源
        Object reportSource = session.getAttribute("reportSource");
        viewer.setReportSource(reportSource);
        viewer.setReportSource(reportSource);      //显示水晶报表

        Object reportSource1 = session.getAttribute("reportSource1");
        viewer.setReportSource(reportSource1);
        
        Object reportSource2 = session.getAttribute("reportSource2");
        viewer.setReportSource(reportSource1);
        
        Object reportSource3 = session.getAttribute("reportSource3");
        viewer.setReportSource(reportSource1);
        
        viewer.processHttpRequest(request, response, this.getServletConfig().getServletContext(), null);
    } catch (Exception ex) {
        out.println(ex);
    }
%>