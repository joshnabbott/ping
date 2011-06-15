class HrProfilesController < AuthenticatedController

  load_and_authorize_resource :person
  load_and_authorize_resource :hr_profile, :through => :person, :singleton => true

  # GET /people/1/hr_profile
  # GET /people/1/hr_profile.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @hr_profile }
      format.json  { render :json => @hr_profile }
    end
  end

  # GET /people/1/hr_profile/edit
  def edit
  end

  # PUT /people/1/hr_profile
  # PUT /people/1/hr_profile.xml
  def update
    respond_to do |format|
      if @hr_profile.update_attributes(params[:hr_profile])
        format.html { redirect_to([:edit, @person, :hr_profile], :notice => 'HR profile was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @hr_profile.errors, :status => :unprocessable_entity }
      end
    end
  end

end
