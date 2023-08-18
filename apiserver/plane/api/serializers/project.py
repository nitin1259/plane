# Django imports
from django.db import IntegrityError

# Third party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from plane.api.serializers.workspace import WorkSpaceSerializer
from plane.api.serializers.user import UserSerializer
from plane.db.models import (
    Project,
    ProjectMember,
    ProjectMemberInvite,
    ProjectIdentifier,
    ProjectFavorite,
    ProjectDeployBoard,
)


class ProjectSerializer(BaseSerializer):
    # workspace = WorkSpaceSerializer(read_only=True)
    default_assignee = UserSerializer(
        fields=("id", "first_name", "last_name", "avatar", "is_bot", "display_name"),
        read_only=True,
    )
    project_lead = UserSerializer(
        fields=("id", "first_name", "last_name", "avatar", "is_bot", "display_name"),
        read_only=True,
    )
    is_favorite = serializers.BooleanField(read_only=True)
    total_members = serializers.IntegerField(read_only=True)
    total_cycles = serializers.IntegerField(read_only=True)
    total_modules = serializers.IntegerField(read_only=True)
    is_member = serializers.BooleanField(read_only=True)
    sort_order = serializers.FloatField(read_only=True)
    member_role = serializers.IntegerField(read_only=True)
    is_deployed = serializers.BooleanField(read_only=True)
    workspace_detail = WorkSpaceSerializer(
        source="workspace",
        # fields=("id", "name", "slug"),
        read_only=True,
    ) 

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = [
            "workspace",
        ]

    def create(self, validated_data):
        identifier = validated_data.get("identifier", "").strip().upper()
        if identifier == "":
            raise serializers.ValidationError(detail="Project Identifier is required")

        if ProjectIdentifier.objects.filter(
            name=identifier, workspace_id=self.context["workspace_id"]
        ).exists():
            raise serializers.ValidationError(detail="Project Identifier is taken")
        project = Project.objects.create(
            **validated_data, workspace_id=self.context["workspace_id"]
        )
        _ = ProjectIdentifier.objects.create(
            name=project.identifier,
            project=project,
            workspace_id=self.context["workspace_id"],
        )
        return project

    def update(self, instance, validated_data):
        identifier = validated_data.get("identifier", "").strip().upper()

        # If identifier is not passed update the project and return
        if identifier == "":
            project = super().update(instance, validated_data)
            return project

        # If no Project Identifier is found create it
        project_identifier = ProjectIdentifier.objects.filter(
            name=identifier, workspace_id=instance.workspace_id
        ).first()
        if project_identifier is None:
            project = super().update(instance, validated_data)
            project_identifier = ProjectIdentifier.objects.filter(
                project=project
            ).first()
            if project_identifier is not None:
                project_identifier.name = identifier
                project_identifier.save()
            return project
        # If found check if the project_id to be updated and identifier project id is same
        if project_identifier.project_id == instance.id:
            # If same pass update
            project = super().update(instance, validated_data)
            return project

        # If not same fail update
        raise serializers.ValidationError(detail="Project Identifier is already taken")


class ProjectDetailSerializer(BaseSerializer):
    workspace = WorkSpaceSerializer(read_only=True)
    default_assignee = UserSerializer(
        fields=("id", "first_name", "last_name", "avatar", "is_bot", "display_name"),
        read_only=True,
    )
    project_lead = UserSerializer(
        fields=("id", "first_name", "last_name", "avatar", "is_bot", "display_name"),
        read_only=True,
    )
    is_favorite = serializers.BooleanField(read_only=True)
    total_members = serializers.IntegerField(read_only=True)
    total_cycles = serializers.IntegerField(read_only=True)
    total_modules = serializers.IntegerField(read_only=True)
    is_member = serializers.BooleanField(read_only=True)
    sort_order = serializers.FloatField(read_only=True)
    member_role = serializers.IntegerField(read_only=True)
    is_deployed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"


class ProjectMemberSerializer(BaseSerializer):
    workspace = WorkSpaceSerializer(read_only=True)
    project = ProjectSerializer(fields=("id", "name", "cover_image", "icon_prop", "emoji", "description"), read_only=True)
    member = UserSerializer(
        fields=("id", "first_name", "last_name", "avatar", "is_bot", "display_name"),
        read_only=True,
    )

    class Meta:
        model = ProjectMember
        fields = "__all__"


class ProjectMemberAdminSerializer(BaseSerializer):
    workspace = WorkSpaceSerializer(
        source="workspace",
        fields=("id", "name", "slug"),
        read_only=True,
    ) 
    project = ProjectSerializer(fields=("id", "name", "cover_image", "icon_prop", "emoji", "description"), read_only=True)
    member = UserSerializer(
        fields=(
            "id",
            "first_name",
            "last_name",
            "avatar",
            "is_bot",
            "display_name",
            "email",
        ),
        read_only=True,
    )

    class Meta:
        model = ProjectMember
        fields = "__all__"


class ProjectMemberInviteSerializer(BaseSerializer):
    project = ProjectSerializer(fields=("id", "name", "cover_image", "icon_prop", "emoji", "description"), read_only=True)
    workspace = WorkSpaceSerializer(
        fields=("id", "name", "slug"),
        read_only=True,
    ) 

    class Meta:
        model = ProjectMemberInvite
        fields = "__all__"


class ProjectIdentifierSerializer(BaseSerializer):
    class Meta:
        model = ProjectIdentifier
        fields = "__all__"


class ProjectFavoriteSerializer(BaseSerializer):
    project_detail = ProjectSerializer(source="project", fields=("id", "name", "cover_image", "icon_prop", "emoji", "description"), read_only=True)

    class Meta:
        model = ProjectFavorite
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "user",
        ]


class ProjectMemberLiteSerializer(BaseSerializer):
    member = UserSerializer(
        fields=("id", "first_name", "last_name", "avatar", "is_bot", "display_name"),
        read_only=True,
    )
    is_subscribed = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["member", "id", "is_subscribed"]
        read_only_fields = fields


class ProjectDeployBoardSerializer(BaseSerializer):
    project_details = ProjectSerializer(source="project", fields=("id", "name", "cover_image", "icon_prop", "emoji", "description"), read_only=True)
    workspace_detail = WorkSpaceSerializer(
        source="workspace",
        fields=("id", "name", "slug"),
        read_only=True,
    ) 

    class Meta:
        model = ProjectDeployBoard
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "project" "anchor",
        ]
