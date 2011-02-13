Factorypeople::Application.routes.draw do

  get "log_out" => "sessions#destroy", :as => "log_out"
  get "log_in" => "sessions#new", :as => "log_in"
  get "sign_up" => "users#new", :as => "sign_up"

  # root :to => "users#new"

  root :to => "home#index"
  match 'admin' => "home#index"
  
  resources :groups do
    :people
  end

  resources :people do
    :groups
  end

  resources :users
  resources :sessions

end
