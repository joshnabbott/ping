class PeopleController < AuthenticatedController

  skip_before_filter :authenticate_credential!, :only => [:index, :show]
  before_filter :search_for_people, :only => :index
  load_and_authorize_resource

  # GET /people
  # GET /people.xml
  def index
    respond_to do |format|
      format.html # index.html.haml
      format.xml    { render :xml => @people }
      format.js     { render :partial => 'search_results', :layout => false, :content_type => 'text/html' }
      format.json   { render :json => @people }
      format.vcf    { send_data @people.map(&:to_vcard).map(&:to_s).join("\n"), :filename => 'directory.vcf' }
    end
  end

  # GET /people/1
  # GET /people/1.xml
  def show
    respond_to do |format|
      format.html # show.html.haml
      format.xml  { render :xml => @person }
      format.json { render :json => @person }
      format.vcf  { send_data @person.to_vcard.to_s, :filename => @person.default_username + '.vcf' }
    end
  end

  # GET /people/new
  # GET /people/new.xml
  def new
    @groups = Group.all
    respond_to do |format|
      format.html # new.html.haml
      format.xml  { render :xml => @person }
      format.json  { render :json => @person }
    end
  end

  # GET /people/1/edit
  def edit
    @groups = Group.all
  end

  # POST /people
  # POST /people.xml
  def create
    respond_to do |format|
      if @person.save
        format.html { redirect_to(@person, :notice => 'Person was successfully created.') }
        format.xml  { render :xml => @person, :status => :created, :location => @person }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @person.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /people/1
  # PUT /people/1.xml
  def update
    respond_to do |format|
      if @person.update_attributes(params[:person])
        format.html { redirect_to(@person, :notice => 'Person was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @person.errors, :status => :unprocessable_entity }
      end
    end
  end

  protected

  def search_for_people
    @people = Person.search(params[:search], :where => { :is_active => true }, :star => true, :retry_stale => true, :page => params[:page], :per_page => 50, :order => :last_name)
  end
end
