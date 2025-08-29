package com.example.movieapplication.models;

import android.app.Application;

import androidx.lifecycle.MutableLiveData;

import com.example.movieapplication.R;
import com.example.movieapplication.serviceapi.GetService;
import com.example.movieapplication.serviceapi.MovieServiceApi;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MovieRepository {

    Application application;
    ArrayList<Movie> movieArrayList = new ArrayList<>();
    MutableLiveData<List<Movie>> mutableLiveData = new MutableLiveData<>();

    public MovieRepository(Application application) {
        this.application = application;
    }

    public MutableLiveData<List<Movie>> getMutableLiveData() {

        MovieServiceApi movieServiceApi = GetService.getService();
        Call<Result> call = movieServiceApi.getPopularMovies(application.getApplicationContext().getString(R.string.api_key));

        call.enqueue(new Callback<Result>() {
            @Override
            public void onResponse(Call<Result> call, Response<Result> response) {
                Result result = response.body();

                if(result!=null && result.getResults()!=null)
                {
                    movieArrayList = (ArrayList<Movie>) result.getResults();
                    mutableLiveData.setValue(movieArrayList);
                }
            }

            @Override
            public void onFailure(Call<Result> call, Throwable t) {

            }
        });


        return mutableLiveData;

    }
}
