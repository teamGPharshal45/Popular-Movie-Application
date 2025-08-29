package com.example.movieapplication.serviceapi;

import com.example.movieapplication.models.Result;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface MovieServiceApi {


    @GET("movie/popular")
    Call<Result> getPopularMovies(@Query("api_key") String apiKey);
}
