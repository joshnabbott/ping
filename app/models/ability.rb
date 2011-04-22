class Ability
  include CanCan::Ability

  def initialize(credential)

    can :manage, :all if Rails.env.development?

    person = credential.person

    # User can hit the home page
    can :view, :home

    # User can manage their own public profile
    can :manage_public_profile, Person, :id => credential.person.id

    # IT can manage groups, IT/Facilities profiles
    if person.group_names.include?('IT')
      can :manage,                    Person
      can :manage_it_profile,         Person
      can :manage_facilities_profile, Person
      can :manage,                    Group
    end

    # HR can manage HR profiles
    if person.group_names.include?('HR')
      can :manage,                    Person
      can :manage_hr_profile,         Person
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
