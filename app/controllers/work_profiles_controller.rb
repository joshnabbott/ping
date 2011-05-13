class WorkProfilesController < AuthenticatedController

  load_and_authorize_resource :person
  load_and_authorize_resource :work_profile, :through => :person, :singleton => true

  # GET /people/1/work_profile
  # GET /people/1/work_profile.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @work_profile }
      format.json  { render :json => @work_profile }
    end
  end

  # GET /people/1/work_profile/edit
  def edit
  end

  # PUT /people/1/work_profile
  # PUT /people/1/work_profile.xml
  def update
    respond_to do |format|
      if @work_profile.update_attributes(params[:work_profile])
        format.html { redirect_to(@person, :notice => 'Work profile was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @work_profile.errors, :status => :unprocessable_entity }
      end
    end
  end

end
