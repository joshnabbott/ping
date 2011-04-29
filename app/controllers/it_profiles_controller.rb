class ItProfilesController < AuthenticatedController

  load_and_authorize_resource :person
  load_and_authorize_resource :it_profile, :through => :person, :singleton => true

  # GET /people/1/it_profile
  # GET /people/1/it_profile.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @it_profile }
      format.json  { render :json => @it_profile }
    end
  end

  # GET /people/1/it_profile/edit
  def edit
  end

  # PUT /people/1/it_profile
  # PUT /people/1/it_profile.xml
  def update
    respond_to do |format|
      if @it_profile.update_attributes(params[:it_profile])
        format.html { redirect_to([:person, @it_profile], :notice => 'IT profile was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @it_profile.errors, :status => :unprocessable_entity }
      end
    end
  end

end
