package com.asyf.demo.controller;

import com.asyf.demo.utils.CRJavaHelper;
import com.crystaldecisions.ReportViewer.ReportViewerBean;
import com.crystaldecisions.sdk.occa.report.application.ReportClientDocument;
import com.crystaldecisions.sdk.occa.report.data.Fields;
import com.crystaldecisions.sdk.occa.report.data.ParameterField;
import com.crystaldecisions.sdk.occa.report.data.ParameterFieldDiscreteValue;
import com.crystaldecisions.sdk.occa.report.data.Values;
import com.crystaldecisions.sdk.occa.report.application.DataDefController;
import com.crystaldecisions.sdk.occa.report.data.IParameterField;
import com.asyf.demo.utils.CRJavaHelper;
import com.mysql.jdbc.Statement;
import com.sun.el.parser.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.jsp.jstl.sql.Result;

import java.sql.DriverManager;
import java.sql.ResultSet;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@Controller
public class DemoController {
    
    //jsp测试
    @RequestMapping("/search")
    public String search(Model m) {
        return "search";
    }
    
    @PostMapping("/result")
    public String result(Model model, HttpServletRequest request) throws Exception {
        // 水晶报表的位置
        final String REPORT_NAME = "result.rpt";
        //打开报表
        ReportClientDocument reportClientDoc = new ReportClientDocument();
        reportClientDoc.open(REPORT_NAME, 0);
        
        // 从search页面中获得参数
        String name = request.getParameter("name");
        String startDateStr = request.getParameter("startDate");
        String endDateStr = request.getParameter("endDate");

        HttpSession session = request.getSession();
        
        // 连接jdbc
        final String DBUSERNAME = "root";
        final String DBPASSWORD = "babybaby";
        final String CONNECTION_URL = "jdbc:mysql://localhost:3306/accountdb";
                
         java.sql.Connection connection = DriverManager.getConnection(CONNECTION_URL, DBUSERNAME, DBPASSWORD);
         
        // 获取明细对账单上部分
        // sql部分：获取每个子账户最新的余额作为当下余额。rpt部分：直接显示
        String queryStatement = "SELECT sub_txn.`s1.SUB_AC_SEQ`, sub_txn.currency, sub_txn.BAL, sub_txn.`TRX DATE`, sub_txn.SUB_ACC_NO\n" + 
                "from sub_txn\n" + 
                "inner JOIN (SELECT sub_txn.SUB_ACC_NO, MAX(sub_txn.`TRX DATE`) AS lastest FROM sub_txn GROUP BY sub_txn.SUB_ACC_NO) lt\n" + 
                "ON (lt.lastest = sub_txn.`TRX DATE` AND lt.SUB_ACC_NO = sub_txn.SUB_ACC_NO)\n" + 
                "WHERE sub_txn.SUB_ACC_NO IN (\n" + 
                "SELECT sub_txn.SUB_ACC_NO from sub_txn, main_acct, main_sub_relation \n" + 
                "where main_acct.`NAME` = \"" + name + "\" \n" + 
                "AND main_acct.ACCOUNT_NO = main_sub_relation.ACCOUNT_NO\n" + 
                "AND main_sub_relation.`S1.SUB_AC` = sub_txn.SUB_ACC_NO);";
        ResultSet resultStatement = connection.prepareStatement(queryStatement).executeQuery();
        CRJavaHelper.passResultSet(reportClientDoc, resultStatement, "sub_txn", "statement");
        
        // 获取交易细节
        // sql部分：根据交易人姓名，开始日期和结束日期筛选出所有交易。rpt部分：根据子账号分类显示
       String queryTxn = "SELECT * FROM sub_txn, main_acct, main_sub_relation \n" + 
               "WHERE main_acct.`NAME` = \"" + name + "\" \n" +
               "AND main_acct.ACCOUNT_NO = main_sub_relation.ACCOUNT_NO \n" + 
               "AND sub_txn.SUB_ACC_NO = main_sub_relation.`S1.SUB_AC`\n" + 
               "AND sub_txn.`TRX DATE` BETWEEN '" + startDateStr + "' AND '" + endDateStr + "';";
       System.out.println(queryTxn);
       ResultSet resultSetTxn = connection.prepareStatement(queryTxn).executeQuery();
       CRJavaHelper.passResultSet(reportClientDoc, resultSetTxn, "sub_txn", "txndetail");

         // 获取acct no
         String queryAcctNo = "select ACCOUNT_NO from main_acct WHERE `NAME` = \"" + name + "\"";
         System.out.println(queryAcctNo);
         ResultSet resultSetAcctNo = connection.prepareStatement(queryAcctNo).executeQuery();
         String acctNo = new String();
         while (resultSetAcctNo.next()) {
             acctNo += resultSetAcctNo.getString("ACCOUNT_NO");
         }
         CRJavaHelper.addDiscreteParameterValue(reportClientDoc, "", "acct_no", acctNo);
         CRJavaHelper.addDiscreteParameterValue(reportClientDoc, "txndetail", "acct_no_detail", acctNo);
         
         
        // 获取reference number
         String refNo = endDateStr.replace("-", "");
         reportClientDoc.getDataDefController().getParameterFieldController().setCurrentValue("", "ref_no", refNo);
         
         // 获取周期
         String period = startDateStr + " to " + endDateStr;
         reportClientDoc.getDataDefController().getParameterFieldController().setCurrentValue("", "period", period);

         // 获取对账单下部分（用参数方式导入）
         // sql部分：直接获取根据币种分类后的最新余额相加值，以及币种，用逗号分隔，以字符串形式导入rpt。rpt部分：将字符串分行显示
         // TODO：非常规方法，可以改进
         String querySubStatement = "SELECT SUM(sub_txn.BAL) AS sum_bal, sub_txn.`s1.SUB_AC_SEQ`, sub_txn.currency, sub_txn.BAL, sub_txn.`TRX DATE`, sub_txn.SUB_ACC_NO\n" + 
                 "from sub_txn\n" + 
                 "inner JOIN (SELECT sub_txn.SUB_ACC_NO, MAX(sub_txn.`TRX DATE`) AS lastest FROM sub_txn GROUP BY sub_txn.SUB_ACC_NO) lt\n" + 
                 "ON (lt.lastest = sub_txn.`TRX DATE` AND lt.SUB_ACC_NO = sub_txn.SUB_ACC_NO)\n" + 
                 "WHERE sub_txn.SUB_ACC_NO IN (\n" + 
                 "SELECT sub_txn.SUB_ACC_NO from sub_txn, main_acct, main_sub_relation \n" + 
                 "where main_acct.`NAME` = \"" + name + "\" \n" + 
                 "AND main_acct.ACCOUNT_NO = main_sub_relation.ACCOUNT_NO\n" + 
                 "AND main_sub_relation.`S1.SUB_AC` = sub_txn.SUB_ACC_NO)\n" + 
                 "GROUP BY sub_txn.currency;";
         ResultSet resultSetSubStatement = connection.prepareStatement(querySubStatement).executeQuery();
         String subCurr = new String();
         String subSum = new String();
         while (resultSetSubStatement.next()) {
             subCurr += resultSetSubStatement.getString("currency") + ",";
             subSum += resultSetSubStatement.getInt("sum_bal") + ",";
         }
         reportClientDoc.getDataDefController().getParameterFieldController().setCurrentValue("", "sub_curr", subCurr);
         reportClientDoc.getDataDefController().getParameterFieldController().setCurrentValue("", "sub_sum", subSum);
         
         session.setAttribute("reportSource", reportClientDoc.getReportSource());

        return "result";
    }
    
}
