package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import javax.servlet.http.HttpSession;

public class SessionFilter extends ZuulFilter {

    private static final Logger logger = LoggerFactory.getLogger(SessionFilter.class);

    @Autowired(required = false)
    private SessionRepository<? extends Session> sessionRepository;

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 10;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {
        try {
            RequestContext ctx = RequestContext.getCurrentContext();
            HttpSession httpSession = ctx.getRequest().getSession();
            if (sessionRepository != null) {
                sessionRepository.findById(httpSession.getId());
            }
            ctx.addZuulRequestHeader("Cookie", httpSession.getId());
            logger.debug("Session id: {}", httpSession.getId());
        } catch (Exception e) {
            // Redis tat / khong ket noi duoc: khong lam sap ca gateway (500 GENERAL)
            logger.warn("SessionFilter bo qua (Redis/session): {}", e.toString());
        }
        return null;
    }
}