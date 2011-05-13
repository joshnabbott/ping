Factorypeople::Application.routes.draw do

  devise_for :credentials

  root :to => "home#index"
  match 'admin' => "home#index"
  
  resources :groups

  resources :people do
    resource :public_profile
    resource :it_profile
    resource :hr_profile
    resource :facilities_profile
    resource :emergency_profile
    resource :work_profile
    resource :credential
  end

end
