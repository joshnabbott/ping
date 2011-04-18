class SessionsController < ApplicationController

  def new
  end

  def create
    user = User.authenticate(params[:name], params[:password])
    if user
      session[:user_id] = user.id
      redirect_to root_url, :notice => "Logged in!"
    else
      flash.now.alert = "Invalid email or password"
      render "new"
    end
  end 

  def destroy
    session[:user_id] = nil
    redirect_to root_url, :notice => "Logged out!"
  end
  
  def authenticate_admin
      auth_hash = request.env['omniauth.auth']
      puts auth_hash.inspect

      session[:admin_user] = auth_hash['user_info']['email']

      if admin?
        redirect_to '/'
      else
        render :text => '401 Unauthorized', :status => 401
      end
    end

end