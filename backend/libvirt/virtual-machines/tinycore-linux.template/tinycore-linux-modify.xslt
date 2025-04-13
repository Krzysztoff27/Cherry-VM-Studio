<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:vm="http://example.com/virtualization" 
    exclude-result-prefixes="vm"
    version="1.0">
    <xsl:param name="new-uuid"/>
    <xsl:param name="new-name"/>
    <xsl:param name="new-group"/>
    <xsl:param name="new-group-member-id"/>

    <!-- TEMPLATE MATCH -->
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>

    <!-- NAME -->
    <xsl:template match="name">
        <name>
        <xsl:value-of select="$new-name"/>
        </name>
    </xsl:template>

    <!-- UUID -->
    <xsl:template match="uuid">
        <uuid>
        <xsl:value-of select="$new-uuid"/>
        </uuid>
    </xsl:template>

    <!-- GROUP -->
    <xsl:template match="vm:info/vm:group">
        <vm:group>
            <xsl:value-of select="$new-group"/>
        </vm:group>
    </xsl:template>

    <!-- GROUP MEMBER ID -->
    <xsl:template match="vm:info/vm:groupMemberId">
        <vm:groupMemberId>
            <xsl:value-of select="$new-group-member-id"/>
        </vm:groupMemberId>
    </xsl:template>

    <!-- FINAL TRANSFORM -->
    <xsl:template match="node()|@*">
        <xsl:message>Copying: <xsl:value-of select="name()"/></xsl:message>
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>