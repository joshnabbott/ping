class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def create
    @user = User.new(params[:user])
    @connected_person = Person.find_by_username(@user.name)
    if @connected_person
      @user.person = @connected_person
      if @user.save
        redirect_to root_url, :notice => "Signed up!"
      else
        render "new"
      end
    else
      flash.now.alert = "Invalid username."
      render "new"
    end
  end

end
