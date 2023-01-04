<%@page contentType=" text/html " %>
<%@page pageEncoding="UTF-8" %>
<%@page import=" com.crystaldecisions.sdk.occa.report.* " %>  <%--  webreporting.jar --%>
<%@page import=" com.crystaldecisions.report.web.viewer.* " %>
<%@ page import="com.asyf.demo.utils.CRJavaHelper" %>
<%@ page import="com.crystaldecisions.sdk.occa.report.application.ReportClientDocument" %>
<%
    // 水晶报表的位置
    final String REPORT_NAME = "test2.rpt";
%>
<%
    try {
        //打开报表
        ReportClientDocument reportClientDoc = new ReportClientDocument();
        reportClientDoc.open(REPORT_NAME, 0);

        //更换数据源
        String username = "root";
        String password = "babybaby";
        String driverName = "com.mysql.jdbc.Driver";
        String connectionURL = "jdbc:mysql://localhost:3306/accountdb";
        String jndiName = "JDBC(JNDI)";
        CRJavaHelper.changeDataSource(reportClientDoc, username, password, connectionURL, driverName, jndiName);

        //给参数赋值
        //第二个参数代表子报表，设置主报表参数，设置为空串
        CRJavaHelper.addDiscreteParameterValue(reportClientDoc, "", "deptNoPar", 10);
        //C:\\Users\\Administrator\\Desktop\\001.jpg"
        CRJavaHelper.addDiscreteParameterValue(reportClientDoc, "", "imagePath", "");

        // 把报表源放进session,传递到报表显示页面
        session.setAttribute("reportSource", reportClientDoc.getReportSource());

        //可以将代码放放到后端，jsp页面就可以公用了

        // 建立一个viewer对象实例,并设置
        CrystalReportViewer viewer = new CrystalReportViewer();
        viewer.setOwnPage(true);
        viewer.setOwnForm(true);
        viewer.setPrintMode(CrPrintMode.ACTIVEX);

        // 从session中取报表源
        Object reportSource = session.getAttribute("reportSource");
        viewer.setReportSource(reportSource);
        viewer.setReportSource(reportClientDoc.getReportSource());      //显示水晶报表
        viewer.processHttpRequest(request, response, this.getServletConfig().getServletContext(), null);
    } catch (Exception ex) {
        out.println(ex);
    }
%>