module.exports = ({
  building,
  gateway,
}) => `
<?xml version="1.0" encoding="utf-8" ?>
<root>
  <common>
    <building_id>${building}</building_id>
    <gateway_id>${gateway}</gateway_id>
    <type>continuous</type>
  </common>
  <data operation="continuous">
    <sequence>201803061010</sequence>
    <parse>yes</parse>
    <time>201803061010</time>
    <total>30</total>
    <current>22</current>
    <meter id="1">
      <function
        id="1"
        coding="abc"
        error="0"
      >data0</function>
      <function
        id="2"
        coding="abc"
        error="0"
      >data1</function>
    </meter>
    <meter id="2">
      <function
        id="1"
        coding="abc"
        error="0"
      >data2</function>
    </meter>
  </data>
</root>
`;
