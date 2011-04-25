Factorypeople::Application.routes.draw do

  devise_for :credentials

  root :to => "home#index"
  match 'admin' => "home#index"
  
  resources :groups

  resources :people do
    collection  { get :search }
    member      { get :vcard  }
  end

end
