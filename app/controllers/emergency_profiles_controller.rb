class EmergencyProfilesController < AuthenticatedController

  load_and_authorize_resource :person
  load_and_authorize_resource :emergency_profile, :through => :person, :singleton => true

  # GET /people/1/emergency_profile
  # GET /people/1/emergency_profile.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @emergency_profile }
      format.json  { render :json => @emergency_profile }
    end
  end

  # GET /people/1/emergency_profile/edit
  def edit
  end

  # PUT /people/1/emergency_profile
  # PUT /people/1/emergency_profile.xml
  def update
    respond_to do |format|
      if @emergency_profile.update_attributes(params[:emergency_profile])
        format.html { redirect_to([:person, @emergency_profile], :notice => 'Emergency profile was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @emergency_profile.errors, :status => :unprocessable_entity }
      end
    end
  end

end
