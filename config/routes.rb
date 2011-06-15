Factorypeople::Application.routes.draw do

  devise_for :credentials

  root :to => "home#index"
  match 'admin' => "home#index"

  resources :assets
  resources :groups
  resources :services

  resources :people do
    resource :public_profile
    resource :it_profile
    resource :hr_profile
    resource :facilities_profile
    resource :emergency_profile
    resource :work_profile
    resource :credential
  end

  authenticate :credential do
    mount Resque::Server.new, :at => "/resque"
  end
end
