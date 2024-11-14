// components/FilterButton.tsx
import React, { useState } from 'react';
import { Modal, Text, VStack, HStack, Checkbox, IconButton, Icon, Box, Button } from 'native-base';
import { X, Filter } from 'lucide-react-native';
import DefaultButton from '../components/Button';  // Assuming DefaultButton and OutlineButton are located here
import OutlineButton from '../components/OutlineButton';

type FilterButtonProps = {
  onApplyFilters: (filters: string[]) => void;
};

const FilterButton: React.FC<FilterButtonProps> = ({ onApplyFilters }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filters = ['Starred', 'Personal/Casual', 'Smart Casual', 'Formal', 'Sports', 'Summer', 'Outdoor/Adventure'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)  // Remove filter if already selected
        : [...prevFilters, filter]  // Add filter if not selected
    );
  };

  const applyFilters = () => {
    onApplyFilters(selectedFilters);
    setShowModal(false);
  };

  return (
    <>
      {/* Filter Button with Funnel Icon */}
      <Box>
        <HStack space={1} alignItems="center">
            <Button onPress={() => setShowModal(true)} colorScheme="gray" variant="solid" size="sm" leftIcon={<Icon as={Filter} color="white" size="sm" />}>
                FILTER
            </Button>
        </HStack>
      </Box>

      {/* Filter Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
        <Modal.Content bg="gray.900" borderRadius="lg" p={4}>
          {/* Modal Header with Title and Close Icon */}
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text color="white" fontSize="lg" fontWeight="bold">
              FILTER
            </Text>
            <IconButton
              icon={<Icon as={X} color="white" size={20} />}
              onPress={() => setShowModal(false)}
            />
          </HStack>

          {/* Filter Options */}
          <Modal.Body>
            <VStack space={4}>
              {filters.map((filter) => (
                <HStack key={filter} alignItems="center" space={3}>
                  <Checkbox
                    value={filter}
                    _text={{ color: 'gray.200' }}
                  >
                    {filter}
                  </Checkbox>
                </HStack>
              ))}
            </VStack>
          </Modal.Body>

          {/* Modal Footer with Show Results and Reset Buttons */}
          <Modal.Footer bg="gray.900" borderTopWidth={0} flexDirection="column">
            <DefaultButton title="SHOW RESULTS" onPress={applyFilters} />
            <OutlineButton title="RESET" onPress={() => setSelectedFilters([])} mt={3} />
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default FilterButton;
