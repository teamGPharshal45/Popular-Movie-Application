package com.example.movieapplication.serviceapi;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class GetService {

     static Retrofit retrofit = null;
     static String Base_url = "https://api.themoviedb.org/3/";

    public static MovieServiceApi getService(){
        if(retrofit == null )
        {
            retrofit = new Retrofit.Builder()
                    .baseUrl(Base_url)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

        }

        return retrofit.create(MovieServiceApi.class);
    }
}
