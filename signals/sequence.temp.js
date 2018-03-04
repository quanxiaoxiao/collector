module.exports = ({
  building,
  gateway,
  sequence,
}) => `
<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <common>
    <building_id>${building}</building_id>
    <gateway_id>${gateway}</gateway_id>
    <type>sequence</type>
  </common>
  <id_validate operation="sequence">
    <sequence>${sequence}</sequence>
  </id_validate>
</root>
`;
