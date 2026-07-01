package com.rainbowforest.reviewservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "review_edit_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer oldRating;

    @Column(nullable = false, length = 1000)
    private String oldContent;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date editedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    @JsonIgnore
    private Review review;
}
