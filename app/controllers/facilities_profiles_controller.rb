class FacilitiesProfilesController < AuthenticatedController

  load_and_authorize_resource :person
  load_and_authorize_resource :facilities_profile, :through => :person, :singleton => true

  # GET /people/1/facilities_profile
  # GET /people/1/facilities_profile.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @facilities_profile }
      format.json  { render :json => @facilities_profile }
    end
  end

  # GET /people/1/facilities_profile/edit
  def edit
  end

  # PUT /people/1/facilities_profile
  # PUT /people/1/facilities_profile.xml
  def update
    respond_to do |format|
      if @facilities_profile.update_attributes(params[:facilities_profile])
        format.html { redirect_to([:edit, @person, :facilities_profile], :notice => 'Facilities profile was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @facilities_profile.errors, :status => :unprocessable_entity }
      end
    end
  end

end
