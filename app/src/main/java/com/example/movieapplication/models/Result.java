package com.example.movieapplication.models;


import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;


/* Model class use to store the api responses from the MovieDb*/

public class Result {




    // The Fields Mentioned in the Json response

    @SerializedName("page")
    @Expose
    private Integer page;

    @SerializedName("total_pages")
    @Expose
    private Integer totalPages;

    @SerializedName("total_results")
    @Expose()
    private Integer totalResults;

    @SerializedName("results")
    private List<Movie> results = null;








    // Parameterized Constructor to initialize the fields of class

    public Result(Integer page, Integer totalPages, Integer totalResults, List<Movie> results) {
        this.page = page;
        this.totalPages = totalPages;
        this.totalResults = totalResults;
        this.results = results;
    }

    // Default constructor to handle the exception

    public Result() {
    }








    //Getters & Setter methods to manipulate the fields of class


    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Integer getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(Integer totalResults) {
        this.totalResults = totalResults;
    }

    public List<Movie> getResults() {
        return results;
    }

    public void setResults(List<Movie> results) {
        this.results = results;
    }


}



