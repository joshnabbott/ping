class Ability
  include CanCan::Ability

  def initialize(credential)

    # Public can search for people
    can :read,    Person
    can :read,    PublicProfile

    # Can't authorize anything if there's no associated person
    return unless credential && (person = credential.person)

    # Credential can update its own password
    can :change_password, Credential, :id => credential.id

    # Anyone can hit the home page if they're authenticated
    can :read,    :home

    # User can manage their own public and emergency profiles and credentials
    can :update,  Person,            :id => person.id
    can :update,  PublicProfile,     :person_id => person.id
    can :update,  EmergencyProfile,  :person_id => person.id
    can :update,  Credential,        :person_id => person.id
    can :update,  FacilitiesProfile, :person_id => person.id # There's a terrible hack for this in facilities profile form

    # User can view their own IT, HR, and Facilities profiles
    can :read,    ItProfile,         :person_id => person.id
    can :read,    HrProfile,         :person_id => person.id
    can :read,    WorkProfile,       :person_id => person.id

    # IT can manage groups and IT/Facilities profiles
    if person.group_names.include?('IT')
      can :manage, Asset
      can :manage, Person
      can :manage, ItProfile
      can :manage, FacilitiesProfile
      can :manage, WorkProfile
      can :manage, Group
      can :manage, Credential
      can :manage, Service
    end

    # HR can manage HR profiles
    if person.group_names.include?('HR')
      can :manage, Person
      can :manage, HrProfile
      can :manage, PublicProfile
      can :manage, FacilitiesProfile
      can :manage, WorkProfile
      can :manage, EmergencyProfile
      can :manage, Group
    end

    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end
    #
    # The first argument to `can` is the action you are giving the user permission to do.
    # If you pass :manage it will apply to every action. Other common actions here are
    # :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on. If you pass
    # :all it will apply to every resource. Otherwise pass a Ruby class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details: https://github.com/ryanb/cancan/wiki/Defining-Abilities
  end
end
