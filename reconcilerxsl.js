XSL = ['<?xml version="1.0" encoding="UTF-8"?>\
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"\
	version="1.0">\
	<xsl:output method="text" omit-xml-declaration="yes" indent="no"/>\
	<!-- spaces between w and pc -->\
	<xsl:template match="tei:pc">\
		<xsl:choose>\
			<xsl:when test="parent::tei:rdg and \
				(parent::tei:rdg/@n != parent::tei:rdg/following-sibling::tei:rdg/@n or not(parent::tei:rdg/following-sibling::tei:rdg))">\
				<xsl:apply-templates/>\
			</xsl:when>\
			<xsl:otherwise>\
				<xsl:apply-templates/>\
				<xsl:text> </xsl:text>\
			</xsl:otherwise>\
		</xsl:choose>\
	</xsl:template>\
	<xsl:template match="tei:w">\
		<xsl:choose>\
			<xsl:when test="following-sibling::tei:w[1]/@n=@n">        \
				<xsl:apply-templates/>\
			</xsl:when>  \
			<xsl:when test="local-name(following-sibling::*[1]) = \'pc\'">\
				<xsl:apply-templates/>\
			</xsl:when>\
			<xsl:when test="parent::tei:rdg">\
				<xsl:choose>\
					<xsl:when test="parent::tei:rdg/w[last()]=current() and (parent::tei:rdg/@n != parent::tei:rdg/following-sibling::tei:rdg/@n or not(parent::tei:rdg/following-sibling::tei:rdg))">\
						<xsl:apply-templates/>                   \
					</xsl:when>\
					<xsl:otherwise>\
						<xsl:apply-templates/>                \
						<xsl:text> </xsl:text>\
					</xsl:otherwise>\
				</xsl:choose>  \
			</xsl:when>          \
			<xsl:otherwise>\
				<xsl:apply-templates/>                \
				<xsl:text> </xsl:text>                \
			</xsl:otherwise>\
		</xsl:choose>\
	</xsl:template>\
	<!-- end spaces between w and pc -->\
	\
	<xsl:template match="tei:app">\
		<xsl:text>[app]</xsl:text>\
		<xsl:apply-templates/>\
		<xsl:text>[\app]</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:rdg">\
		<xsl:text>[</xsl:text><xsl:value-of select="@hand"/><xsl:text>]</xsl:text>\
		<xsl:apply-templates/>\
		<xsl:text>[\</xsl:text><xsl:value-of select="@hand"/><xsl:text>]</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:supplied">\
		<xsl:text>[ill]</xsl:text>\
		<xsl:apply-templates/>\
		<xsl:text>[\ill]</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:space">\
		<xsl:text>&amp;spa</xsl:text>\
		<xsl:value-of select="@extent"/>\
		<xsl:text>; </xsl:text>\
	</xsl:template>\
\
	<xsl:template match="tei:gap">\
		<xsl:text>[ill]</xsl:text>\
		<xsl:value-of select="extent"/>\
		<xsl:text> </xsl:text>\
		<xsl:value-of select="unit"/>\
		<xsl:text>[\ill]</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:unclear">\
		<xsl:apply-templates/>\
		<xsl:text>_</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:abbr">\
		<xsl:apply-templates/>\
		<xsl:text>~</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:div[@type=\'book\']">\
		<xsl:choose>\
			<xsl:when test="not(starts-with(./@n,\'B\'))">\
				<xsl:text>&lt;B </xsl:text><xsl:value-of select="@n"/><xsl:text>&gt; </xsl:text>\
			</xsl:when>\
			<xsl:otherwise>\
				<xsl:choose>\
					<xsl:when test="@n=\'B06\'">\
						<xsl:text>&lt;B Rom&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B07\'">\
						<xsl:text>&lt;B 1Cor&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B08\'">\
						<xsl:text>&lt;B 2Cor&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B09\'">\
						<xsl:text>&lt;B Gal&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B10\'">\
						<xsl:text>&lt;B Eph&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B11\'">\
						<xsl:text>&lt;B Phil&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B12\'">\
						<xsl:text>&lt;B Col&gt; </xsl:text>\
					</xsl:when>\
					<xsl:when test="@n=\'B18\'">\
						<xsl:text>&lt;B Phlm&gt; </xsl:text>\
					</xsl:when>\
				</xsl:choose>\
			</xsl:otherwise>\
		</xsl:choose>\
		<xsl:apply-templates/>\
	</xsl:template>\
	\
	<xsl:template match="tei:div[@type=\'chapter\']">\
		<xsl:choose>\
			<xsl:when test="contains(./@n, \'K\')">\
				<xsl:text>&lt;K </xsl:text><xsl:value-of select="substring-after(./@n, \'K\')"/><xsl:text>&gt; </xsl:text>\
			</xsl:when>\
			<xsl:otherwise>\
				<xsl:text>&lt;K </xsl:text><xsl:value-of select="substring-after(./@n, \'.\')"/><xsl:text>&gt; </xsl:text>\
			</xsl:otherwise>\
		</xsl:choose>\
		<xsl:apply-templates/>\
    </xsl:template>\
	\
	<xsl:template match="tei:fw">\
		<xsl:text>{</xsl:text>\
		<xsl:apply-templates/>\
		<xsl:text>}</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:div[@type=\'incipit\']">\
		<xsl:text>&lt;K incipit&gt; </xsl:text>\
		<xsl:apply-templates/>\
	</xsl:template>\
	\
	<xsl:template match="tei:div[@type=\'explicit\']">\
		<xsl:text>&lt;K explicit&gt; </xsl:text>\
		<xsl:apply-templates/>\
	</xsl:template>\
	\
	<xsl:template match="tei:ab">\
		<xsl:text>&lt;V </xsl:text>\
		<xsl:choose>\
			<xsl:when test="@n">\
				<xsl:choose>\
					<xsl:when test="contains(./@n, \'V\')">\
						<xsl:value-of select="substring-after(./@n, \'V\')"/>\
					</xsl:when>\
					<xsl:otherwise>\
						<xsl:value-of select="substring-after(substring-after(./@n, \'.\'), \'.\')"/>\
					</xsl:otherwise>\
				</xsl:choose>\
			</xsl:when>\
			<xsl:otherwise>\
				<xsl:text>0</xsl:text>\
			</xsl:otherwise>\
		</xsl:choose>\
		<xsl:text>&gt; </xsl:text>\
		<xsl:apply-templates/>\
	</xsl:template>\
	\
	<xsl:template match="tei:lb">\
		<xsl:text>|L </xsl:text>\
		<xsl:value-of select="@n"/>\
		<xsl:text>|\n</xsl:text>\
		<br/>\
	</xsl:template>\
	\
	<xsl:template match="tei:cb">\
		<xsl:text>|C </xsl:text>\
		<xsl:value-of select="@n"/>\
		<xsl:text>|\n</xsl:text>\
	</xsl:template>\
\
	<xsl:template match="tei:pb">\
		<xsl:text>|P </xsl:text>\
		<xsl:value-of select="@xml:id"/>\
		<xsl:text>|\n</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:ex">\
		<xsl:text>(</xsl:text>\
		<xsl:apply-templates/>\
		<xsl:text>)</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:note">\
		<xsl:text>{</xsl:text>\
		<xsl:apply-templates/>\
		<xsl:text>}</xsl:text>\
	</xsl:template>\
	\
	<xsl:template match="tei:teiHeader">\
	</xsl:template>\
</xsl:stylesheet>']
