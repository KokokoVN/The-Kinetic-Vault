package com.rainbowforest.reviewservice.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ReviewReplyDto {
    private Long id;
    private Long userId;
    private String userName;
    private String content;
    private Date createdAt;
}
