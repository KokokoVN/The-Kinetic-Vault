package com.rainbowforest.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
    


@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(
        "/auth/**",
        "/accounts/auth/**",
        "/registration",
        "/registration/verify",
        "/registration/check",
        "/registration/resend-otp",
        "/users/**",
        "/accounts/users/**",
        "/api/accounts/users/**",
        "/addresses/**",
        "/accounts/addresses/**",
        "/admin/**"
).permitAll()
                .anyRequest().denyAll()
                .and()
                .httpBasic().disable()
                .formLogin().disable();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
