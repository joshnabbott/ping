class PublicProfilesController < AuthenticatedController

  skip_before_filter :authenticate_credential!, :only => :show

  load_and_authorize_resource :person
  load_and_authorize_resource :public_profile, :through => :person, :singleton => true

  # GET /people/1/public_profile
  # GET /people/1/public_profile.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @public_profile }
      format.json  { render :json => @public_profile }
    end
  end

  # GET /people/1/public_profile/edit
  def edit
  end

  # PUT /people/1/public_profile
  # PUT /people/1/public_profile.xml
  def update
    respond_to do |format|
      if @public_profile.update_attributes(params[:public_profile])
        format.html { redirect_to([:edit, @person, :public_profile], :notice => "#{pronoun_or_first_name(@public_profile.person)} public profile was successfully updated.") }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @public_profile.errors, :status => :unprocessable_entity }
      end
    end
  end

end
