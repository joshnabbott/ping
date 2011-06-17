class CredentialsController < AuthenticatedController
  load_and_authorize_resource :person
  load_and_authorize_resource :credential, :through => :person, :singleton => true

  # GET /people/1/credential
  # GET /people/1/credential.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @credential }
      format.json  { render :json => @credential }
    end
  end

  # GET /people/1/credential/edit
  def edit
  end

  # PUT /people/1/credential
  # PUT /people/1/credential.xml
  def update
    respond_to do |format|
      if @credential.update_attributes(params[:credential])
        sign_in :credential, @credential, :bypass => true
        format.html { redirect_to(@person, :notice => "#{pronoun_or_first_name(@credential.person)} credentials were successfully updated.") }
        format.xml  { head :ok }
      else
        @credential.password = @credential.password_confirmation = nil
        format.html { render :action => "edit" }
        format.xml  { render :xml => @credential.errors, :status => :unprocessable_entity }
      end
    end
  end
end
