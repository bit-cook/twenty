import { FavoriteFolderNavigationDrawerItemDropdown } from '@/favorites/components/FavoriteFolderNavigationDrawerItemDropdown';
import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoritesDroppable } from '@/favorites/components/FavoritesDroppable';
import { FAVORITE_FOLDER_DELETE_MODAL_ID } from '@/favorites/constants/FavoriteFolderDeleteModalId';
import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useDeleteFavoriteFolder } from '@/favorites/hooks/useDeleteFavoriteFolder';
import { useRenameFavoriteFolder } from '@/favorites/hooks/useRenameFavoriteFolder';
import { openFavoriteFolderIdsState } from '@/favorites/states/openFavoriteFolderIdsState';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Droppable } from '@hello-pangea/dnd';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { IconFolder, IconFolderOpen, IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

type CurrentWorkspaceMemberFavoritesProps = {
  folder: {
    folderId: string;
    folderName: string;
    favorites: ProcessedFavorite[];
  };
  isGroup: boolean;
};

export const CurrentWorkspaceMemberFavorites = ({
  folder,
  isGroup,
}: CurrentWorkspaceMemberFavoritesProps) => {
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const { isDragging } = useContext(FavoritesDragContext);
  const [isFavoriteFolderRenaming, setIsFavoriteFolderRenaming] =
    useState(false);
  const [favoriteFolderName, setFavoriteFolderName] = useState(
    folder.folderName,
  );
  const { openModal } = useModal();

  const [openFavoriteFolderIds, setOpenFavoriteFolderIds] = useRecoilState(
    openFavoriteFolderIdsState,
  );
  const isOpen = openFavoriteFolderIds.includes(folder.folderId);

  const handleToggle = () => {
    setOpenFavoriteFolderIds((currentOpenFolders) => {
      if (isOpen) {
        return currentOpenFolders.filter((id) => id !== folder.folderId);
      } else {
        return [...currentOpenFolders, folder.folderId];
      }
    });
  };

  const { renameFavoriteFolder } = useRenameFavoriteFolder();
  const { deleteFavoriteFolder } = useDeleteFavoriteFolder();

  const dropdownId = `favorite-folder-edit-${folder.folderId}`;

  const isDropdownOpenComponent = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const selectedFavoriteIndex = folder.favorites.findIndex((favorite) =>
    isLocationMatchingFavorite(currentPath, currentViewPath, favorite),
  );

  const { deleteFavorite } = useDeleteFavorite();

  const favoriteFolderContentLength = folder.favorites.length;

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameFavoriteFolder(folder.folderId, value);
    setIsFavoriteFolderRenaming(false);
    return true;
  };

  const handleCancelRename = () => {
    setFavoriteFolderName(folder.folderName);
    setIsFavoriteFolderRenaming(false);
  };

  const handleClickOutside = async (
    event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsFavoriteFolderRenaming(false);
      return;
    }

    await renameFavoriteFolder(folder.folderId, value);
    setIsFavoriteFolderRenaming(false);
  };

  const modalId = `${FAVORITE_FOLDER_DELETE_MODAL_ID}-${folder.folderId}`;

  const handleFavoriteFolderDelete = async () => {
    if (folder.favorites.length > 0) {
      openModal(modalId);
      closeDropdown(dropdownId);
    } else {
      await deleteFavoriteFolder(folder.folderId);
      closeDropdown(dropdownId);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteFavoriteFolder(folder.folderId);
  };

  const rightOptions = (
    <FavoriteFolderNavigationDrawerItemDropdown
      folderId={folder.folderId}
      onRename={() => setIsFavoriteFolderRenaming(true)}
      onDelete={handleFavoriteFolderDelete}
      closeDropdown={() => {
        closeDropdown(dropdownId);
      }}
    />
  );

  const isModalOpened = useRecoilComponentValueV2(
    isModalOpenedComponentState,
    modalId,
  );

  return (
    <>
      <NavigationDrawerItemsCollapsableContainer
        key={folder.folderId}
        isGroup={isGroup}
      >
        {isFavoriteFolderRenaming ? (
          <NavigationDrawerInput
            Icon={IconFolder}
            value={favoriteFolderName}
            onChange={setFavoriteFolderName}
            onSubmit={handleSubmitRename}
            onCancel={handleCancelRename}
            onClickOutside={handleClickOutside}
          />
        ) : (
          <FavoritesDroppable droppableId={`folder-header-${folder.folderId}`}>
            <NavigationDrawerItem
              label={folder.folderName}
              Icon={isOpen ? IconFolderOpen : IconFolder}
              onClick={handleToggle}
              rightOptions={rightOptions}
              className="navigation-drawer-item"
              isRightOptionsDropdownOpen={isDropdownOpenComponent}
              triggerEvent="CLICK"
            />
          </FavoritesDroppable>
        )}

        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          <Droppable droppableId={`folder-${folder.folderId}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
                // TODO: (Drag Drop Bug) Adding bottom margin to ensure drag-to-last-position works. Need to find better solution that doesn't affect spacing.
                // Issue: Without margin, dragging to last position triggers next folder drop area
              >
                {folder.favorites.map((favorite, index) => (
                  <DraggableItem
                    key={favorite.id}
                    draggableId={favorite.id}
                    index={index}
                    isInsideScrollableContainer
                    itemComponent={
                      <NavigationDrawerSubItem
                        label={favorite.labelIdentifier}
                        objectName={favorite.objectNameSingular}
                        Icon={() => <FavoriteIcon favorite={favorite} />}
                        to={isDragging ? undefined : favorite.link}
                        active={index === selectedFavoriteIndex}
                        subItemState={getNavigationSubItemLeftAdornment({
                          index,
                          arrayLength: favoriteFolderContentLength,
                          selectedIndex: selectedFavoriteIndex,
                        })}
                        rightOptions={
                          <LightIconButton
                            Icon={IconHeartOff}
                            onClick={() => deleteFavorite(favorite.id)}
                            accent="tertiary"
                          />
                        }
                        isDragging={isDragging}
                        triggerEvent="CLICK"
                      />
                    }
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </AnimatedExpandableContainer>
      </NavigationDrawerItemsCollapsableContainer>

      {isModalOpened &&
        createPortal(
          <ConfirmationModal
            modalId={modalId}
            title={`Remove ${folder.favorites.length} ${folder.favorites.length > 1 ? 'favorites' : 'favorite'}?`}
            subtitle={`This action will delete this favorite folder ${folder.favorites.length > 1 ? `and all ${folder.favorites.length} favorites` : 'and the favorite'} inside. Do you want to continue?`}
            onConfirmClick={handleConfirmDelete}
            confirmButtonText="Delete Folder"
          />,
          document.body,
        )}
    </>
  );
};
