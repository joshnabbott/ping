class PeopleController < ApplicationController
  
   load_and_authorize_resource

  # GET /people
  # GET /people.xml
  def index
    respond_to do |format|
      format.html # index.html.haml
      format.xml  { render :xml => @people }
      format.json  { render :json => @people }
    end
  end

  # GET /people/1
  # GET /people/1.xml
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @person }
      format.json  { render :json => @person }
    end
  end

  # GET /people/new
  # GET /people/new.xml
  def new
    @groups = Group.all
    respond_to do |format|
      format.html # new.html.erb
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

  # DELETE /people/1
  # DELETE /people/1.xml
  def destroy
    @person.destroy
    respond_to do |format|
      format.html { redirect_to(people_url) }
      format.xml  { head :ok }
    end
  end

  def vcard
    card = Vpim::Vcard::Maker.make2 do |maker|
   
      maker.add_name do |name|
            name.given = @person.first_name
            name.family = @person.last_name
      end
   
      # maker.add_addr do |addr|
      #       addr.preferred = true
      #       addr.location = 'work'
      #       addr.street = '243 Felixstowe Road'
      #       addr.locality = 'Ipswich'
      #       addr.country = 'United Kingdom'
      # end

      maker.nickname = @person.nick_name
      maker.title = @person.job_title

      maker.add_tel(@person.work_phone_number)
      maker.add_email(@person.work_email_address) { |e| e.location = 'work' }

    end
   
    send_data card.to_s, :filename => @person.username + '.vcf'
  end

end
