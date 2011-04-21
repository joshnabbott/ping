Factorypeople::Application.routes.draw do

  devise_for :credentials

  root :to => "home#index"
  match 'admin' => "home#index"
  
  resources :groups do
    resources :people
  end

  resources :people do
    member do
      get :vcard
    end
    resources :groups
  end

end
