package com.rainbowforest.recommendationservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.feignClient.UserClient;
import com.rainbowforest.recommendationservice.feignClient.dto.UserClientResponse;
import com.rainbowforest.recommendationservice.http.header.HeaderGenerator;
import com.rainbowforest.recommendationservice.dto.ManualRecommendationCreateRequest;
import com.rainbowforest.recommendationservice.dto.ManualRecommendationResponse;
import com.rainbowforest.recommendationservice.dto.SimilarRecommendationResponse;
import com.rainbowforest.recommendationservice.model.ManualProductRecommendation;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.service.RecommendationService;
import com.rainbowforest.recommendationservice.service.ManualProductRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private UserClient userClient;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ActivityLogPublisher activityLogPublisher;

    @Autowired
    private ManualProductRecommendationService manualRecommendationService;

    @GetMapping(value = "/recommendations")
    private ResponseEntity<List<Recommendation>> getAllRating(@RequestParam("name") String productName){
        List<Recommendation> recommendations = recommendationService.getAllRecommendationByProductName(productName);
        if(!recommendations.isEmpty()) {
        	return new ResponseEntity<List<Recommendation>>(
        		recommendations,
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
        }
        return new ResponseEntity<List<Recommendation>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
    
    @PostMapping(value = "/{userId}/recommendations/{productId}")
    private ResponseEntity<Recommendation> saveRecommendations(
            @PathVariable ("userId") Long userId,
            @PathVariable ("productId") Long productId,
            @RequestParam ("rating") int rating,
            HttpServletRequest request){
    	
    	Product product = productClient.getProductById(productId);
		UserClientResponse user = userClient.getUserById(userId);
    	
		if(product != null && user != null) {
			try {
				Recommendation recommendation = new Recommendation();
				recommendation.setProduct(product);
				recommendation.setUserId(user.getId());
				recommendation.setUserName(user.getUserName());
				recommendation.setRating(rating);
				recommendationService.saveRecommendation(recommendation);
                Map<String, Object> after = new LinkedHashMap<>();
                after.put("recommendationId", recommendation.getId());
                after.put("userId", userId);
                after.put("productId", productId);
                after.put("rating", rating);
                Map<String, Object> detail = new LinkedHashMap<>();
                detail.put("resourceType", "Recommendation");
                detail.put("after", after);
                activityLogPublisher.publish(
                        "product-recommendation-service",
                        "RECOMMENDATION_CREATE",
                        "Recommendation",
                        String.valueOf(recommendation.getId()),
                        "POST",
                        "/" + userId + "/recommendations/" + productId,
                        detail,
                        user.getUserName(),
                        String.valueOf(userId));
				return new ResponseEntity<Recommendation>(
						recommendation,
						headerGenerator.getHeadersForSuccessPostMethod(request, recommendation.getId()),
						HttpStatus.CREATED);
			}catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Recommendation>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
        return new ResponseEntity<Recommendation>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/recommendations/{id}")
    private ResponseEntity<Void> deleteRecommendations(@PathVariable("id") Long id){
    	Recommendation recommendation = recommendationService.getRecommendationById(id);
    	if(recommendation != null) {
    		try {
                Map<String, Object> before = new LinkedHashMap<>();
                before.put("recommendationId", recommendation.getId());
                before.put("userId", recommendation.getUserId());
                before.put("productId", recommendation.getProduct() != null ? recommendation.getProduct().getId() : null);
                before.put("rating", recommendation.getRating());
                Map<String, Object> detail = new LinkedHashMap<>();
                detail.put("resourceType", "Recommendation");
                detail.put("before", before);
                activityLogPublisher.publish(
                        "product-recommendation-service",
                        "RECOMMENDATION_DELETE",
                        "Recommendation",
                        String.valueOf(id),
                        "DELETE",
                        "/recommendations/" + id,
                        detail,
                        recommendation.getUserName(),
                        recommendation.getUserId() != null ? String.valueOf(recommendation.getUserId()) : null);
    			recommendationService.deleteRecommendation(id);
    			return new ResponseEntity<Void>(
    					headerGenerator.getHeadersForSuccessGetMethod(),
    					HttpStatus.OK);
    		}catch (Exception e) {
    			e.printStackTrace();
    			return new ResponseEntity<Void>(
    					headerGenerator.getHeadersForError(),
    					HttpStatus.INTERNAL_SERVER_ERROR);	
    		}
    	}
    	return new ResponseEntity<Void>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/{productId}/manual-recommendations")
    private ResponseEntity<List<ManualRecommendationResponse>> listManualRecommendations(@PathVariable("productId") Long productId) {
        List<ManualProductRecommendation> rows = manualRecommendationService.listForSourceProduct(productId);
        List<ManualRecommendationResponse> out = rows.stream().map((r) -> {
            ManualRecommendationResponse dto = new ManualRecommendationResponse();
            dto.setId(r.getId());
            dto.setSourceProductId(r.getSourceProductId());
            dto.setTargetProductId(r.getTargetProductId());
            dto.setSortOrder(r.getSortOrder());
            dto.setReason(r.getReason());
            try {
                Product p = productClient.getProductById(r.getTargetProductId());
                if (p != null) {
                    dto.setTargetProduct(new ManualRecommendationResponse.TargetProduct(p.getId(), p.getProductName(), p.getSku()));
                }
            } catch (Exception ignored) {
            }
            return dto;
        }).collect(Collectors.toList());
        return new ResponseEntity<List<ManualRecommendationResponse>>(
                out,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/products/{productId}/similar-recommendations")
    private ResponseEntity<List<SimilarRecommendationResponse>> listSimilarRecommendations(
            @PathVariable("productId") Long productId,
            @RequestParam(value = "limit", required = false, defaultValue = "8") Integer limit
    ) {
        List<SimilarRecommendationResponse> out = recommendationService.listSimilarRecommendations(productId, limit != null ? limit : 8);
        return new ResponseEntity<List<SimilarRecommendationResponse>>(
                out,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @PostMapping(value = "/products/{productId}/manual-recommendations")
    private ResponseEntity<?> createManualRecommendation(
            @PathVariable("productId") Long productId,
            @RequestBody ManualRecommendationCreateRequest req,
            HttpServletRequest request
    ) {
        try {
            ManualProductRecommendation created = manualRecommendationService.create(
                    productId,
                    req.getTargetProductId(),
                    req.getSortOrder(),
                    req.getReason(),
                    req.getPerformedBy()
            );
            Map<String, Object> after = new LinkedHashMap<>();
            after.put("id", created.getId());
            after.put("sourceProductId", created.getSourceProductId());
            after.put("targetProductId", created.getTargetProductId());
            after.put("sortOrder", created.getSortOrder());
            after.put("reason", created.getReason());
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ManualProductRecommendation");
            detail.put("after", after);
            activityLogPublisher.publish(
                    "product-recommendation-service",
                    "MANUAL_RECOMMENDATION_CREATE",
                    "ManualProductRecommendation",
                    String.valueOf(created.getId()),
                    "POST",
                    "/products/" + productId + "/manual-recommendations",
                    detail,
                    req.getPerformedBy(),
                    null
            );
            return new ResponseEntity<ManualProductRecommendation>(
                    created,
                    headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                    HttpStatus.CREATED
            );
        } catch (Exception e) {
            return new ResponseEntity<Object>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    @DeleteMapping(value = "/products/{productId}/manual-recommendations/{id}")
    private ResponseEntity<?> deleteManualRecommendation(
            @PathVariable("productId") Long productId,
            @PathVariable("id") Long id,
            @RequestParam(value = "performedBy", required = false) String performedBy
    ) {
        try {
            Map<String, Object> before = new LinkedHashMap<>();
            before.put("id", id);
            before.put("sourceProductId", productId);
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("resourceType", "ManualProductRecommendation");
            detail.put("before", before);
            activityLogPublisher.publish(
                    "product-recommendation-service",
                    "MANUAL_RECOMMENDATION_DELETE",
                    "ManualProductRecommendation",
                    String.valueOf(id),
                    "DELETE",
                    "/products/" + productId + "/manual-recommendations/" + id,
                    detail,
                    performedBy,
                    null
            );
            manualRecommendationService.delete(productId, id, performedBy);
            return new ResponseEntity<Object>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<Object>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }
    }
}
