<%@page contentType=" text/html " %>
<%@page pageEncoding="UTF-8" %>
<%@page import=" com.crystaldecisions.report.web.viewer.CrPrintMode " %>  <%--  webreporting.jar --%>
<%@page import=" com.crystaldecisions.report.web.viewer.CrystalReportViewer " %>
<%@page import=" com.crystaldecisions.sdk.occa.report.data.Fields " %>
<%@page import=" com.crystaldecisions.sdk.occa.report.data.ParameterField " %>
<%@page import=" com.crystaldecisions.sdk.occa.report.data.ParameterFieldDiscreteValue " %>
<%@page import=" com.crystaldecisions.sdk.occa.report.data.Values " %>
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
        viewer.processHttpRequest(request, response, this.getServletConfig().getServletContext(), null);
    } catch (Exception ex) {
        out.println(ex);
    }
%>