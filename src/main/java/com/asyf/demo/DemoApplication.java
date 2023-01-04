package com.asyf.demo;

import com.crystaldecisions.report.web.viewer.CrystalReportViewerServlet;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    //配置serverlet，否则无法加载图片以及一些其他功能
    @Bean
    public ServletRegistrationBean getServletRegistrationBean() {
        ServletRegistrationBean bean = new ServletRegistrationBean(new CrystalReportViewerServlet());
        bean.addUrlMappings("/CrystalReportViewerHandler");
        return bean;
    }

}
